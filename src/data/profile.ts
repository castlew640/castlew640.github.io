interface Profile {
  displayName: string;
  introduction: string;
  background: string;
  aboutParagraphs: string[];
  email: string;
  profileLinks: { label: string; url: string }[];
  resumeUrl: string;
}

// Only owner-confirmed public information belongs in this module.
export const profile: Profile = {
  displayName: 'William Castle',
  introduction:
    'I build software around what people are trying to achieve, from the first idea to deployment.',
  background:
    'I’m a recent computer science graduate with experience delivering software for a client across three separate paid contracts.',
  aboutParagraphs: [
    'I’m good at talking through a problem with someone, getting into the technical details, and figuring out what they actually need. Sometimes that means building software. Sometimes an existing tool makes more sense, or we need to do some research before deciding.',
    'I’ve been the sole developer across three client contracts: a website, a Wi-Fi planner, and an AI demo. That involved figuring out what mattered to the client, making choices within their budget, and getting the work running.',
  ],
  email: 'castlew640@gmail.com',
  profileLinks: [
    { label: 'GitHub', url: 'https://github.com/castlew640' },
    { label: 'LinkedIn', url: 'https://linkedin.com/in/will-castle-swefh' },
    { label: 'Indeed', url: 'https://profile.indeed.com/?hl=en_US&co=US&from=gnav-homepage--homepage-frontend' },
  ],
  resumeUrl: '/resume/william-castle-resume.pdf',
};
