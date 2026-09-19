interface Profile {
  displayName: string;
  introduction: string;
  background: string;
  email: string;
  profileLinks: { label: string; url: string }[];
  resumeUrl: string | null;
}

// Only owner-confirmed public information belongs in this module.
export const profile: Profile = {
  displayName: 'William Castle',
  introduction:
    'I build software around what people are trying to achieve, from the first idea to deployment.',
  background:
    'I’m a recent computer science graduate with experience delivering software for a client across three separate paid contracts.',
  email: 'castlew640@gmail.com',
  profileLinks: [{ label: 'GitHub', url: 'https://github.com/castlew640' }],
  // The owner has deferred selection of the actual public resume to Plan 01-02.
  resumeUrl: null,
};
