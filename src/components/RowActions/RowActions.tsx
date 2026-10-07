import React from 'react';
import styles from './RowActions.module.css';
import { Eye, Edit2, Trash2 } from 'lucide-react';

export interface RowActionsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
  viewTitle?: string;
  editTitle?: string;
  deleteTitle?: string;
}

export const RowActions: React.FC<RowActionsProps> = ({
  onView,
  onEdit,
  onDelete,
  canEdit = true,
  canDelete = true,
  viewTitle = 'View details',
  editTitle = 'Edit record',
  deleteTitle = 'Delete record',
}) => {
  return (
    <div className={styles.actions} role="group" aria-label="Row actions">
      {onView && (
        <button
          type="button"
          onClick={onView}
          className={styles.actionBtn}
          title={viewTitle}
          aria-label={viewTitle}
        >
          <Eye size={16} />
        </button>
      )}

      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          disabled={!canEdit}
          className={styles.actionBtn}
          title={editTitle}
          aria-label={editTitle}
        >
          <Edit2 size={16} />
        </button>
      )}

      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          disabled={!canDelete}
          className={`${styles.actionBtn} ${styles.deleteBtn}`.trim()}
          title={deleteTitle}
          aria-label={deleteTitle}
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
};

export default RowActions;
