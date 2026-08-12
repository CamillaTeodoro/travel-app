import type { Timestamp } from '@angular/fire/firestore';

import type { PlanId } from './plan.model';

export type LeadStatus = 'novo' | 'em-contato' | 'convertido' | 'perdido';

/** Documento `leads/{leadId}` — pedido gerado ao selecionar um plano. */
export interface Lead {
  id?: string;
  userId: string;
  quizId: string;
  destinationId: string | null;
  planId: PlanId;
  planPriceBRL: number;
  contact: {
    name: string;
    email: string;
    whatsapp: string | null;
  };
  status: LeadStatus;
  createdAt: Timestamp;
}
