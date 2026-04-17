import { DndContext } from '@dnd-kit/core';

export function DndWrapper({ children }) {
  return <DndContext>{children}</DndContext>;
}
