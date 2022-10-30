import { Factory } from 'fishery';
import { v4 } from 'uuid';

type MembershipType = {
  id: string;
  admin: boolean;
  userId: string;
  groupId: string;
};

export const membershipFactory = Factory.define<MembershipType>(
  ({ params }) => {
    return {
      id: v4(),
      admin: params.admin,
      userId: params.userId,
      groupId: params.groupId,
    };
  }
);
