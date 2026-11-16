import React from 'react';
import { useParams } from 'react-router-dom';
import { GroupDetailCore } from '../../components/GroupDetailCore';

export const UserGroupDetailsPage: React.FC = () => {
  const { groupId = '' } = useParams();

  return (
    <GroupDetailCore
      groupId={groupId}
      backPath="/dashboard/groups"
      backLabel="Back to My Groups"
    />
  );
};
