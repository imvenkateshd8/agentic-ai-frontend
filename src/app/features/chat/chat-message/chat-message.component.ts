import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Message, MessageRole } from '../../../core/models/chat.models';
import { marked } from 'marked';

@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatChipsModule],
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.scss']
})
export class ChatMessageComponent implements OnInit {
  @Input() message!: Message;
  renderedContent: SafeHtml | string = '';

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    if (this.isAssistant) {
      // Configure marked options
      marked.setOptions({
        breaks: true,
        gfm: true
      });
      
      // Parse markdown and sanitize HTML
      const parsed = marked.parse(this.message.content) as string;
      this.renderedContent = this.sanitizer.sanitize(1, parsed) || '';
    } else {
      this.renderedContent = this.message.content;
    }
  }

  get isUser(): boolean {
    return this.message.role === MessageRole.USER;
  }

  get isAssistant(): boolean {
    return this.message.role === MessageRole.ASSISTANT;
  }

  get timestamp(): string {
    const date = new Date(this.message.timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
