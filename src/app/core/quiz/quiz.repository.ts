import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  addDoc,
  collection,
  serverTimestamp,
} from '@angular/fire/firestore';

import type { QuizAnswers } from '../models';

/**
 * Persistência do quiz no Firestore (`quizzes/{quizId}`).
 * Camada fina sobre o SDK — a lógica de estado/validação vive no QuizService.
 */
@Injectable({ providedIn: 'root' })
export class QuizRepository {
  private readonly firestore = inject(Firestore);

  /** Cria o documento do quiz e retorna o id gerado. */
  async createQuiz(userId: string, answers: QuizAnswers): Promise<string> {
    const ref = await addDoc(collection(this.firestore, 'quizzes'), {
      userId,
      answers,
      status: 'pending',
      createdAt: serverTimestamp(),
      completedAt: null,
    });
    return ref.id;
  }
}
