import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import styles from './Users.module.css';
import {
  UserPlus,
  RotateCcw,
  Lock,
  Phone,
  X,
  ShieldAlert,
} from 'lucide-react';
import { PageContainer } from '../../components/PageContainer/PageContainer';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { PrimaryButton } from '../../components/PrimaryButton/PrimaryButton';
import { SecondaryButton } from '../../components/SecondaryButton/SecondaryButton';
import { SearchBar } from '../../components/SearchBar/SearchBar';
import { FilterSelect } from '../../components/FilterSelect/FilterSelect';
import { DataTable, Column } from '../../components/DataTable/DataTable';
import { RowActions } from '../../components/RowActions/RowActions';
import { ConfirmDialog } from '../../components/ConfirmDialog/ConfirmDialog';
import { FormField } from '../../components/FormField/FormField';
import { Avatar } from '../../components/Avatar/Avatar';
import { usersApi } from './api';
import { User, UserRole, UserFormData } from '../../types/user';
import { useAuth } from '../../hooks/useAuth';

export const Users: React.FC = () => {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  const isAdminOrSuperAdmin =
    Boolean(currentUser?.role) &&
    (currentUser?.role === 'admin' || currentUser?.role === 'superadmin');

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('clinician');
  const [formPassword, setFormPassword] = useState('Password@123');
  const [formError, setFormError] = useState<string | null>(null);

  // Query users
  const {
    data: users = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getUsers(),
  });

  // Create User Mutation
  const createMutation = useMutation({
    mutationFn: (data: UserFormData) => usersApi.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      handleCloseModal();
    },
  });

  // Update User Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Partial<UserFormData> }) =>
      usersApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      handleCloseModal();
    },
  });

  // Delete User Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => usersApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDeletingUser(null);
    },
  });

  // Filtered Users (exclude SuperAdmin from directory list)
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (u.role?.toLowerCase() === 'superadmin') return false;

      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phoneNumber && u.phoneNumber.toLowerCase().includes(q)) ||
        (u.designation && u.designation.toLowerCase().includes(q));

      const matchesRole = !roleFilter || u.role.toLowerCase() === roleFilter.toLowerCase();
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('');
  };

  const hasActiveFilters = Boolean(searchTerm || roleFilter);

  // Modal Open Handlers
  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormRole('clinician');
    setFormPassword('Password@123');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (u: User) => {
    setEditingUser(u);
    setFormName(u.name);
    setFormEmail(u.email);
    setFormPhone(u.phoneNumber || '');
    setFormRole(u.role);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormError(null);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Please provide a full name.');
      return;
    }
    if (!formEmail.trim() || !formEmail.includes('@')) {
      setFormError('Please provide a valid email address.');
      return;
    }
    if (!editingUser && formPassword.trim().length < 8) {
      setFormError('Initial password must be at least 8 characters long.');
      return;
    }

    setFormError(null);

    const payload: UserFormData = {
      name: formName.trim(),
      email: formEmail.trim(),
      phoneNumber: formPhone.trim(),
      role: formRole,
      password: !editingUser ? (formPassword.trim() || 'Password@123') : undefined,
    };

    if (editingUser) {
      await updateMutation.mutateAsync({ id: editingUser.id, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
  };

  // Role Badge Helper
  const renderRoleBadge = (role: UserRole) => {
    const roleKey = String(role).toLowerCase();
    let badgeClass = styles.roleBadgeClinician;
    if (roleKey === 'superadmin') badgeClass = styles.roleBadgeSuperadmin;
    if (roleKey === 'admin') badgeClass = styles.roleBadgeAdmin;
    if (roleKey === 'nurse') badgeClass = styles.roleBadgeNurse;

    return <span className={badgeClass}>{role.toUpperCase()}</span>;
  };

  // Columns definition
  const columns: Column<User>[] = [
    {
      id: 'name',
      header: 'User',
      sortable: true,
      accessor: 'name',
      cell: (u) => (
        <div className={styles.userCell}>
          <Avatar name={u.name} size="sm" />
          <div className={styles.userMeta}>
            <span className={styles.userName}>{u.name}</span>
            {u.designation ? <span className={styles.userSub}>{u.designation}</span> : null}
          </div>
        </div>
      ),
    },
    {
      id: 'email',
      header: 'Email',
      sortable: true,
      accessor: 'email',
      cell: (u) => (
        <span className={styles.emailText}>
          {u.email}
        </span>
      ),
    },
    {
      id: 'role',
      header: 'Role',
      sortable: true,
      accessor: 'role',
      align: 'center',
      cell: (u) => renderRoleBadge(u.role),
    },
    {
      id: 'phoneNumber',
      header: 'Phone Number',
      align: 'center',
      cell: (u) => {
        // Phone number is strictly visible only for admin and superadmin
        if (isAdminOrSuperAdmin) {
          return (
            <span className={styles.phoneText}>
              <Phone size={13} style={{ color: 'var(--color-primary)' }} />
              {u.phoneNumber || '—'}
            </span>
          );
        }
        return (
          <span className={styles.phoneRestricted} title="Protected health authority contact. Visible to Administrators only.">
            <Lock size={12} />
            •••••••••• (Restricted)
          </span>
        );
      },
    },
  ];

  // Actions column: only displayed if current user has admin or superadmin privileges
  if (isAdminOrSuperAdmin) {
    columns.push({
      id: 'actions',
      header: 'Actions',
      align: 'center',
      width: 100,
      cell: (u) => (
        <RowActions
          onEdit={() => handleOpenEditModal(u)}
          onDelete={() => setDeletingUser(u)}
          editTitle="Edit user credentials and role"
          deleteTitle="Remove user from directory"
        />
      ),
    });
  }

  return (
    <PageContainer>
      <PageHeader
        title="User Directory"
        subtitle="Healthcare personnel and access control directory across clinical and administrative tiers."
        action={
          isAdminOrSuperAdmin ? (
            <PrimaryButton
              icon={<UserPlus size={16} />}
              onClick={handleOpenAddModal}
            >
              Register User
            </PrimaryButton>
          ) : undefined
        }
      />

      {/* Non-admin Privacy Disclaimer Notice */}
      {!isAdminOrSuperAdmin && (
        <div className={styles.privacyNotice} role="note">
          <ShieldAlert size={16} />
          <span>
            Staff Privacy Policy: Contact phone numbers and credential management are restricted to authorized System Administrators.
          </span>
        </div>
      )}

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchContainer}>
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search users by name, email, role, or phone..."
          />
        </div>

        <div className={styles.filtersGroup}>
          <FilterSelect
            value={roleFilter}
            options={[
              { label: 'Admin', value: 'admin' },
              { label: 'Clinician', value: 'clinician' },
              { label: 'Nurse', value: 'nurse' },
            ]}
            onChange={setRoleFilter}
            placeholder="All Roles"
          />

          <button
            type="button"
            className={styles.clearFiltersBtn}
            onClick={clearFilters}
            disabled={!hasActiveFilters}
            aria-label="Clear filters"
            title={hasActiveFilters ? 'Clear all active filters' : 'No active filters to clear'}
          >
            <RotateCcw size={14} />
            <span>Clear Filters</span>
          </button>
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={filteredUsers}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        emptyTitle="No users found"
        emptyDescription="No directory records match your current filter criteria."
        emptyAction={
          isAdminOrSuperAdmin ? (
            <PrimaryButton
              icon={<UserPlus size={16} />}
              onClick={handleOpenAddModal}
            >
              Register User
            </PrimaryButton>
          ) : undefined
        }
      />

      {/* Add / Edit User Modal */}
      {isModalOpen && (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true">
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingUser ? 'Edit User Credentials' : 'Register New User'}
              </h2>
              <button
                type="button"
                onClick={handleCloseModal}
                className={styles.closeBtn}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className={styles.form} noValidate>
              {formError && (
                <div style={{ color: 'var(--color-danger)', fontSize: '13px', fontWeight: 600 }}>
                  {formError}
                </div>
              )}

              <FormField
                label="Full Name"
                placeholder="e.g. Dr. Kavita Deshmukh"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
              />

              <FormField
                label="Email Address"
                type="email"
                placeholder="e.g. kdeshmukh@healthtech.gov.in"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                required
              />

              <FormField
                label="Phone Number"
                type="tel"
                placeholder="e.g. +91 98765 43210"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                hint="Contact number visible only to Administrators."
              />

              <FormField
                as="select"
                label="Role Assignment"
                value={formRole}
                onChange={(e) => setFormRole(e.target.value as UserRole)}
                required
              >
                <option value="clinician">Clinician (Doctor / Medical Officer)</option>
                <option value="nurse">Nurse (Community Health Nurse)</option>
                <option value="admin">Administrator (System & Record Manager)</option>
              </FormField>

              {!editingUser && (
                <FormField
                  label="Initial Password"
                  type="text"
                  placeholder="e.g. Password@123"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  hint="Initial credentials provided to user for first login."
                  required
                />
              )}

              <div className={styles.modalActions}>
                <SecondaryButton type="button" onClick={handleCloseModal}>
                  Cancel
                </SecondaryButton>
                <PrimaryButton
                  type="submit"
                  isLoading={createMutation.isPending || updateMutation.isPending}
                  disabled={
                    !formName.trim() ||
                    !formEmail.trim() ||
                    !formRole ||
                    (!editingUser && !formPassword.trim())
                  }
                >
                  {editingUser ? 'Save Changes' : 'Register User'}
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingUser)}
        title="Confirm User Deletion"
        message={`Are you sure you want to permanently remove ${deletingUser?.name} (${deletingUser?.email}) from the platform? This access revocation cannot be undone.`}
        confirmLabel="Delete User"
        cancelLabel="Keep User"
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          if (deletingUser) {
            deleteMutation.mutate(deletingUser.id);
          }
        }}
        onCancel={() => setDeletingUser(null)}
      />
    </PageContainer>
  );
};

export default Users;
