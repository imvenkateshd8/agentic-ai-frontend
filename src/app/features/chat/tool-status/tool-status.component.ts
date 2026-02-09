import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ToolStatus } from '../../../core/models/chat.models';

@Component({
  selector: 'app-tool-status',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <mat-card class="tool-status" [class.complete]="toolStatus.status === 'complete'">
      <div class="status-content">
        <mat-spinner
          *ngIf="toolStatus.status === 'running'"
          diameter="20"
          class="status-spinner"
        ></mat-spinner>
        <mat-icon *ngIf="toolStatus.status === 'complete'" class="status-icon">
          check_circle
        </mat-icon>
        <mat-icon *ngIf="toolStatus.status === 'error'" class="status-icon error">
          error
        </mat-icon>

        <div class="status-text">
          <span class="status-label">{{ statusLabel }}</span>
          <span class="tool-name">{{ toolStatus.name }}</span>
        </div>
      </div>
    </mat-card>
  `,
  styles: [`
    .tool-status {
      padding: 0.75rem 1rem;
      background-color: #ebf8ff;
      border-left: 4px solid #4299e1;
      margin: 0.5rem 0;
      animation: slideIn 0.3s ease-out;

      &.complete {
        background-color: #f0fff4;
        border-left-color: #48bb78;
      }
    }

    .status-content {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .status-spinner {
      flex-shrink: 0;
    }

    .status-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      color: #48bb78;
      flex-shrink: 0;

      &.error {
        color: #f56565;
      }
    }

    .status-text {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .status-label {
      font-size: 12px;
      color: #718096;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .tool-name {
      font-size: 14px;
      color: #2d3748;
      font-weight: 600;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `]
})
export class ToolStatusComponent {
  @Input() toolStatus!: ToolStatus;

  get statusLabel(): string {
    switch (this.toolStatus.status) {
      case 'running':
        return 'Using Tool';
      case 'complete':
        return 'Tool Completed';
      case 'error':
        return 'Tool Error';
      default:
        return 'Tool Status';
    }
  }
}
