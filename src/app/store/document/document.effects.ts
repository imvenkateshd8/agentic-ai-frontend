import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, exhaustMap, tap } from 'rxjs/operators';
import * as DocumentActions from './document.actions';
import { DocumentService } from '../../core/services/document.service';

@Injectable()
export class DocumentEffects {
  uploadDocument$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DocumentActions.uploadDocument),
      exhaustMap(({ upload }) =>
        this.documentService.uploadAndIngest(upload.file, upload.threadId).pipe(
          tap((response) => {
            // Save document metadata locally
            const summary = {
              filename: response.filename,
              chunks: response.chunks,
              documents: response.documents,
              uploadedAt: new Date(),
              status: 'complete' as const
            };
            this.documentService.saveDocumentMetadata(response.thread_id, summary);
          }),
          map((response) =>
            DocumentActions.uploadDocumentSuccess({
              threadId: response.thread_id,
              filename: response.filename,
              summary: {
                filename: response.filename,
                chunks: response.chunks,
                documents: response.documents,
                uploadedAt: new Date(),
                status: 'complete'
              }
            })
          ),
          catchError((error) =>
            of(DocumentActions.uploadDocumentFailure({ error: error.message }))
          )
        )
      )
    )
  );

  loadThreadDocuments$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DocumentActions.loadThreadDocuments),
      exhaustMap(({ threadId }) =>
        this.documentService.getThreadDocuments(threadId).pipe(
          map((documents) =>
            DocumentActions.loadThreadDocumentsSuccess({ threadId, documents })
          ),
          catchError(() => of({ type: 'NO_OP' }))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private documentService: DocumentService
  ) {}
}
