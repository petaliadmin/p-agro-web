import { CanDeactivateFn } from '@angular/router';

export interface HasUnsavedChanges {
  isDirty: boolean;
}

export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (component) => {
  if (component.isDirty) {
    return confirm('Vous avez des modifications non sauvegardées. Voulez-vous vraiment quitter cette page ?');
  }
  return true;
};
