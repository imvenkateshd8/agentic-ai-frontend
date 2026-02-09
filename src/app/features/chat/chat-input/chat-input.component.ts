import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { TextFieldModule } from '@angular/cdk/text-field';

@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatChipsModule,
    TextFieldModule
  ],
  templateUrl: './chat-input.component.html',
  styleUrls: ['./chat-input.component.scss']
})
export class ChatInputComponent {
  @Input() disabled = false;
  @Output() sendMessage = new EventEmitter<{text: string, attachedDocument?: string}>();
  @Output() uploadFile = new EventEmitter<void>();

  messageText = '';
  attachedDocument: string | null = null;

  onSubmit(): void {
    const text = this.messageText.trim();
    if (text && !this.disabled) {
      this.sendMessage.emit({
        text,
        attachedDocument: this.attachedDocument || undefined
      });
      this.messageText = '';
      this.attachedDocument = null;
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSubmit();
    }
  }

  onUploadClick(): void {
    this.uploadFile.emit();
  }

  attachDocument(filename: string): void {
    this.attachedDocument = filename;
  }

  removeAttachment(): void {
    this.attachedDocument = null;
  }

  clearAttachment(): void {
    this.attachedDocument = null;
  }
}
