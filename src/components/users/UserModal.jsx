import { useEffect, useState } from "react";

export default function UserModal({
  open,
  user,
  roles = [],
  onClose,
  onSubmit,
  loading,
}) {
  const isEdit = Boolean(user);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    roleIds: [],
  });

  useEffect(() => {
    if (user) {
      setForm({
        fullName:
          user?.fullName || "",
        email:
          user?.email || "",
        password: "",
        phone:
          user?.phone || "",
        roleIds:
          Array.isArray(user?.roles)
            ? user.roles
                .map(
                  (role) =>
                    role?.id ||
                    role?.roleId
                )
                .filter(Boolean)
            : [],
      });
    } else {
      setForm({
        fullName: "",
        email: "",
        password: "",
        phone: "",
        roleIds: [],
      });
    }
  }, [user, open]);

  if (!open) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value } =
      event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleRoleChange = (
    event
  ) => {
    const selectedId =
      Number(event.target.value);

    setForm((previous) => {
      const exists =
        previous.roleIds.includes(
          selectedId
        );

      return {
        ...previous,
        roleIds: exists
          ? previous.roleIds.filter(
              (id) =>
                id !== selectedId
            )
          : [
              ...previous.roleIds,
              selectedId,
            ],
      };
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const payload = {
      fullName:
        form.fullName.trim(),
      email:
        form.email.trim(),
      phone:
        form.phone.trim(),
      roleIds: form.roleIds,
    };

    if (!isEdit) {
      payload.password =
        form.password;
    } else if (
      form.password.trim()
    ) {
      payload.password =
        form.password;
    }

    onSubmit(payload);
  };

  return (
    <div className="modal-overlay">
      <div className="user-modal">

        <div className="modal-header">
          <div>
            <h2>
              {isEdit
                ? "Edit User"
                : "Create User"}
            </h2>

            <p>
              {isEdit
                ? "Update user information."
                : "Create a new admin user."}
            </p>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            disabled={loading}
          >
            ×
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="user-form"
        >

          <div className="form-group">
            <label>
              Full Name
            </label>

            <input
              type="text"
              name="fullName"
              value={
                form.fullName
              }
              onChange={
                handleChange
              }
              placeholder="Enter full name"
              required
            />
          </div>

          <div className="form-group">
            <label>
              Email
            </label>

            <input
              type="email"
              name="email"
              value={
                form.email
              }
              onChange={
                handleChange
              }
              placeholder="Enter email"
              required
            />
          </div>

          <div className="form-group">
            <label>
              Phone
            </label>

            <input
              type="text"
              name="phone"
              value={
                form.phone
              }
              onChange={
                handleChange
              }
              placeholder="+919999999999"
              required
            />
          </div>

          <div className="form-group">
            <label>
              {isEdit
                ? "Password (optional)"
                : "Password"}
            </label>

            <input
              type="password"
              name="password"
              value={
                form.password
              }
              onChange={
                handleChange
              }
              placeholder={
                isEdit
                  ? "Leave blank to keep current password"
                  : "Enter password"
              }
              required={!isEdit}
            />
          </div>

          <div className="form-group">
            <label>
              Roles
            </label>

            <div className="role-checkboxes">

              {roles.length === 0 ? (
                <p>
                  No roles available.
                </p>
              ) : (
                roles.map((role) => {
                  const roleId =
                    Number(
                      role?.id ||
                        role?.roleId
                    );

                  return (
                    <label
                      className="role-checkbox"
                      key={roleId}
                    >
                      <input
                        type="checkbox"
                        value={roleId}
                        checked={form.roleIds.includes(
                          roleId
                        )}
                        onChange={
                          handleRoleChange
                        }
                      />

                      <span>
                        {role?.name ||
                          role?.roleName ||
                          role?.slug ||
                          `Role ${roleId}`}
                      </span>
                    </label>
                  );
                })
              )}

            </div>
          </div>

          <div className="modal-actions">

            <button
              type="button"
              className="secondary-btn"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-btn"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : isEdit
                ? "Update User"
                : "Create User"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}