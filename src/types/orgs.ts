export type Organization = {
  id: string;
  username: string;
  logo: string;
  readmeTxId: string;
  name: string;
  description: string;
  owner: string;
  members: OrgMember[];
  repos: string[];
  memberInvites: OrgMemberInvite[];
  timestamp: number;
  updatedTimestamp: number;
  website: string;
};

export type OrgMember = {
  role: string;
  address: string;
};

export type OrgMemberInvite = {
  role: string;
  address: string;
  status: string;
  timestamp: number;
};
