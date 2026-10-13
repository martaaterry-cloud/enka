import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { CreateActivityModal } from '../src/features/create/CreateActivityModal';
import { ActivityDetailModal } from '../src/features/detail/ActivityDetailModal';
const state = vi.hoisted(() => ({ value: {} as Record<string, unknown> }));
vi.mock('../src/context', () => ({ useEnka: () => state.value }));
const activity = { id: 'a', title: 'Simulada', categoryId: 'c', date: '2026-10-13', certainty: 'confirmed', createdAt: '2026-10-13T10:00:00Z' };
beforeEach(() => {
  state.value = { categories: [], locations: [], saving: false, storageError: 'No se pudo guardar. Datos conservados.',
    selectedDate: '2026-10-13', isCreateModalOpen: true, closeCreateModal: vi.fn(), isDetailModalOpen: true,
    selectedActivity: activity, closeDetailModal: vi.fn(), addActivity: vi.fn(async () => false),
    updateActivity: vi.fn(async () => false), cancelActivity: vi.fn(async () => false), deleteActivity: vi.fn(async () => false) };
});
afterEach(cleanup);
describe('formularios ante un guardado rechazado', () => {
  it('mantiene el formulario de creación y muestra el error dentro del modal', async () => {
    render(<CreateActivityModal />);
    const dialog = screen.getByRole('dialog');
    fireEvent.change(dialog.querySelector('input')!, { target: { value: 'Nueva simulada' } });
    fireEvent.submit(dialog.querySelector('form')!);
    await waitFor(() => expect(state.value.addActivity).toHaveBeenCalled());
    expect(state.value.closeCreateModal).not.toHaveBeenCalled(); expect(within(dialog).getByRole('alert').textContent).toContain('Datos conservados');
  });
  it('mantiene la edición abierta cuando no se puede guardar', async () => {
    render(<ActivityDetailModal />); fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    fireEvent.submit(document.querySelector('form')!); await waitFor(() => expect(state.value.updateActivity).toHaveBeenCalled());
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeTruthy(); expect(state.value.closeDetailModal).not.toHaveBeenCalled();
  });
  it('no cierra la confirmación de eliminación si falla', async () => {
    render(<ActivityDetailModal />); fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }));
    const dialogs = screen.getAllByRole('dialog'); const confirmation = dialogs[dialogs.length - 1];
    fireEvent.click(within(confirmation).getByRole('button', { name: 'Eliminar' })); await waitFor(() => expect(state.value.deleteActivity).toHaveBeenCalled());
    expect(state.value.closeDetailModal).not.toHaveBeenCalled(); expect(screen.getByText('¿Eliminar actividad?')).toBeTruthy(); expect(within(confirmation).getByRole('alert')).toBeTruthy();
  });
});
