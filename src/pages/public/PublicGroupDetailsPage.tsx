import React from 'react';
import { useParams } from 'react-router-dom';
import { GroupDetailCore } from '../../components/GroupDetailCore';

export const PublicGroupDetailsPage: React.FC = () => {
  const { groupId = '' } = useParams();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <GroupDetailCore
        groupId={groupId}
        backPath="/groups"
        backLabel="Back to Browse Group Deals"
      />
    </div>
  );
};
