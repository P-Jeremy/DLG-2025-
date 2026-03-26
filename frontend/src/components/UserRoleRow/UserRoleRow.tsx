import React from 'react';
import type { UserItem } from '../../api/users';
import './UserRoleRow.scss';

interface UserRoleRowProps {
  user: UserItem;
  isCurrentUser: boolean;
  onToggle: (userId: string, isAdmin: boolean) => void;
}

const UserRoleRow: React.FC<UserRoleRowProps> = ({ user, isCurrentUser, onToggle }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onToggle(user.id, e.target.checked);
  };

  return (
    <tr className="user-role-row">
      <td className="user-role-row__email">{user.email}</td>
      <td className="user-role-row__pseudo">{user.pseudo}</td>
      <td className="user-role-row__toggle">
        <label className={`user-role-row__switch${isCurrentUser ? ' user-role-row__switch--disabled' : ''}`}>
          <input
            type="checkbox"
            checked={user.isAdmin}
            disabled={isCurrentUser}
            onChange={handleChange}
            aria-label={`Rôle admin pour ${user.pseudo}`}
          />
          <span className="user-role-row__slider" />
        </label>
      </td>
    </tr>
  );
};

export default UserRoleRow;
