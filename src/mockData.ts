import { UserProfile, Project, Task } from './types';
import { getTodayString, addDays } from './utils/dateUtils';

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user-1',
    name: 'Erick',
    initials: 'ED',
    email: 'erick@kgbycia.com',
    color: '#e44232', // Todoist Red
    avatarBg: 'bg-red-600 text-white',
  },
  {
    id: 'user-2',
    name: 'María',
    initials: 'MG',
    email: 'maria@ejemplo.com',
    color: '#2563eb', // Blue
    avatarBg: 'bg-blue-600 text-white',
  },
];

export const INITIAL_PROJECTS: Project[] = [
  { id: 'inbox', name: 'Bandeja de entrada', color: '#64748b', icon: 'Inbox' },
  { id: 'proj-1', name: 'Te damos la bienvenida 👋', color: '#e44232', icon: 'Sparkles' },
  { id: 'proj-2', name: 'Trabajo & Clientes 💼', color: '#3b82f6', icon: 'Briefcase' },
  { id: 'proj-3', name: 'Hogar & Personal 🏠', color: '#10b981', icon: 'Home' },
];

export function getInitialTasks(): Task[] {
  const today = getTodayString();
  const yesterday = addDays(today, -1);
  const tomorrow = addDays(today, 1);
  const inTwoDays = addDays(today, 2);
  const inFiveDays = addDays(today, 5);

  return [
    {
      id: 'task-1',
      title: 'Hacer diapositivas para la reunión mensual',
      description: 'Incluir métricas de ventas y avances del segundo semestre.',
      dueDate: today,
      dueTime: '10:00',
      priority: 'p1',
      projectId: 'proj-1',
      assignedTo: 'user-1',
      completed: false,
      createdBy: 'user-1',
      createdAt: new Date().toISOString(),
      attachments: [
        {
          id: 'att-1',
          name: 'Grafico_Ventas_Q2.png',
          url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
          uploadedAt: new Date().toISOString(),
        }
      ],
      subtasks: [
        {
          id: 'sub-1',
          title: 'Extraer reporte de conversión y ventas de Q2',
          description: 'Consultar el panel de Stripe y la base de datos de facturación para obtener los números exactos.',
          completed: true,
          completedAt: new Date().toISOString(),
          attachments: [
            {
              id: 'att-sub-1',
              name: 'Dashboard_Metricas.png',
              url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
              uploadedAt: new Date().toISOString(),
            }
          ],
        },
        {
          id: 'sub-2',
          title: 'Diseñar la portada y estructura de 10 láminas',
          description: 'Usar la paleta de colores de la empresa (rojo #e44232 y blanco neutro).',
          completed: false,
          attachments: [],
        },
        {
          id: 'sub-3',
          title: 'Revisar con María antes de enviar a los directores',
          description: 'Enviar enlace de borrador por mensaje para recibir feedback rápido.',
          completed: false,
          attachments: [],
        },
      ],
    },
    {
      id: 'task-2',
      title: 'Revisar presupuesto compartido de diseño',
      description: 'Coordinar con María para aprobar las cotizaciones pendientes.',
      dueDate: today,
      dueTime: '14:30',
      priority: 'p2',
      projectId: 'proj-2',
      assignedTo: 'user-2',
      completed: false,
      createdBy: 'user-1',
      createdAt: new Date().toISOString(),
      subtasks: [
        {
          id: 'sub-2-1',
          title: 'Comparar cotización del proveedor A y B',
          description: 'Evaluar tiempos de entrega y costos de licencias de software.',
          completed: true,
          completedAt: new Date().toISOString(),
        },
        {
          id: 'sub-2-2',
          title: 'Firmar orden de compra aprobada',
          description: 'Generar PDF con firma digital y enviar a finanzas.',
          completed: false,
        },
      ],
    },
    {
      id: 'task-3',
      title: 'Sincronizar calendario y asignaciones del equipo',
      description: 'Verificar fechas de entrega y tareas cruzadas de la semana.',
      dueDate: today,
      priority: 'p3',
      projectId: 'inbox',
      assignedTo: 'all',
      completed: false,
      createdBy: 'user-2',
      createdAt: new Date().toISOString(),
      subtasks: [
        {
          id: 'sub-3-1',
          title: 'Chequear días festivos del mes',
          description: 'Ajustar fechas límites de entrega según el feriado.',
          completed: false,
        },
        {
          id: 'sub-3-2',
          title: 'Confirmar asistencia a la reunión semanal',
          completed: false,
        },
      ],
    },
    {
      id: 'task-4',
      title: 'Enviar reporte semanal a gerencia',
      dueDate: yesterday,
      dueTime: '18:00',
      priority: 'p1',
      projectId: 'proj-2',
      assignedTo: 'user-1',
      completed: false,
      createdBy: 'user-1',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-5',
      title: 'Comprar suministros para la oficina',
      dueDate: tomorrow,
      priority: 'p4',
      projectId: 'proj-3',
      assignedTo: 'user-2',
      completed: false,
      createdBy: 'user-2',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-6',
      title: 'Planificar sprint de desarrollo con el cliente',
      dueDate: inTwoDays,
      dueTime: '11:00',
      priority: 'p2',
      projectId: 'proj-2',
      assignedTo: 'user-1',
      completed: false,
      createdBy: 'user-1',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-7',
      title: 'Presentación final y entrega de proyecto',
      dueDate: inFiveDays,
      dueTime: '16:00',
      priority: 'p1',
      projectId: 'proj-1',
      assignedTo: 'all',
      completed: false,
      createdBy: 'user-1',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-8',
      title: 'Configurar entorno inicial y usuarios',
      dueDate: today,
      priority: 'p3',
      projectId: 'proj-1',
      assignedTo: 'user-1',
      completed: true,
      completedAt: new Date().toISOString(),
      completedBy: 'user-1',
      createdBy: 'user-1',
      createdAt: new Date().toISOString(),
    },
  ];
}
