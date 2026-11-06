/*
  KIVO legal pages.
  Edit the wording here; the Terms and Privacy pages render from this file.
  When the wording changes in a way users should agree to again, bump TERMS_VERSION
  (it is saved with each new sign-up as a record of what they accepted).
*/

export const TERMS_VERSION = "2026-11-06";
export const LAST_UPDATED = "6 November 2026";
export const CONTACT_EMAIL = "sathviklexicon@gmail.com";
export const OPERATOR = "Sathvik Suresh";

// Each section: { id, title, body: [paragraph | { list: [...] }] }
// Text inside **double asterisks** is shown in bold.

export const TERMS = {
  title: "Terms of Service",
  intro: [
    `Welcome to KIVO (the "Platform"). These Terms of Service ("Terms") are a binding agreement between you ("you", "User") and ${OPERATOR}, who operates KIVO as an individual sole proprietor based in Bengaluru, Karnataka, India ("we", "us", "the Operator"). By creating an account or using the Platform, you agree to these Terms and to our Privacy Policy.`,
  ],
  sections: [
    {
      id: "who-can-use",
      title: "Who can use KIVO",
      body: [
        {
          list: [
            "You must be at least 18 years old to create an account or use the Platform. By registering, you confirm that you are 18 or older.",
            "You must give accurate registration information and keep it up to date.",
            "You are responsible for everything that happens under your account, including keeping your password secure.",
          ],
        },
      ],
    },
    {
      id: "what-we-do",
      title: "What KIVO does",
      body: [
        "KIVO is a platform where people (students, graduates, working professionals and career-switchers, called \"Contributors\") create profiles, complete challenges posted by organisations, showcase their work, and can be discovered by recruiters and organisations.",
        "We provide the Platform and its tools. We do not employ Contributors, guarantee any opportunity, interview or job, or act as a recruitment agency.",
      ],
    },
    {
      id: "conduct",
      title: "Your conduct",
      body: [
        "You agree that you will not:",
        {
          list: [
            "Post false, misleading, plagiarised or fraudulent information, including fake credentials or work you did not create.",
            "Impersonate any person or organisation, or misrepresent your affiliation with one.",
            "Upload content that is unlawful, defamatory, harassing, obscene, or that infringes anyone's intellectual property or privacy.",
            "Try to gain unauthorised access to the Platform, other accounts or the admin panel, or interfere with the Platform's security or operation.",
            "Scrape, harvest or collect other users' data except through features we provide for that purpose.",
            "Use the Platform to send spam or unsolicited commercial messages.",
          ],
        },
        "We may suspend or remove accounts or content that break these Terms.",
      ],
    },
    {
      id: "your-content",
      title: "Your content and who owns it",
      body: [
        "\"Your Work\" means anything you post: profile details, projects, links, challenge submissions, written explanations, designs, code, analyses and related material.",
        "**You own Your Work.** Nothing in your use of the Platform transfers ownership of Your Work to us or to any other user or organisation.",
        "So that we can run the Platform, you give the Operator a licence to use Your Work that is:",
        {
          list: [
            "**Non-exclusive:** you stay free to use, publish and license Your Work anywhere else.",
            "**Royalty-free and worldwide:** we do not pay for it, and it applies wherever the Platform is used.",
            "**Limited in purpose:** it lets us only host, store, display, reproduce and promote Your Work to operate, improve and market the Platform (for example, on your profile, in the talent directory, or in material about the Platform).",
          ],
        },
        "This licence does not let us sell Your Work, claim authorship of it, or license it to anyone else for their own commercial use.",
        "By posting Your Work you confirm that you created it or have the right to post it, and that it does not infringe anyone's rights or break a confidentiality or non-disclosure obligation (for example, work done for an employer or during an internship).",
        "You can remove most of Your Work at any time from your dashboard. Once removed, our licence for future use ends, though copies may remain briefly in backups. Verified submissions may be kept, as explained below.",
      ],
    },
    {
      id: "challenges",
      title: "Challenges and organisations",
      body: [
        {
          list: [
            "When you respond to a challenge posted by an organisation, **you keep ownership of your submission**.",
            "The organisation does not receive any ownership of, or licence to, your submission through the Platform. It can view what you submit so it can evaluate it. Any transfer or licence of rights to that organisation must be agreed separately and directly between you and them, in writing. The Operator is not a party to that agreement.",
            "Organisations that post challenges confirm that they are entitled to share the brief and that it contains no confidential information they are not allowed to disclose.",
          ],
        },
      ],
    },
    {
      id: "verification",
      title: "Verification",
      body: [
        "Some submissions carry a \"verified\" badge with the name and title of the person who reviewed them. Verification reflects that reviewer's opinion at a point in time. We do not guarantee the accuracy, quality or outcome of any submission, and verification is not an endorsement, job offer or guarantee by the Operator.",
        "You still own a verified submission. To keep verification records trustworthy, a verified submission and its verification details may be kept on the Platform even if you remove other content. Contact us if you have a genuine reason to remove one (for example, a confidentiality concern).",
      ],
    },
    {
      id: "recruiters",
      title: "Recruiters and organisations",
      body: [
        "If you use the Platform as a recruiter or on behalf of an organisation, you also agree to:",
        {
          list: [
            "Use Contributors' information only to evaluate and contact candidates for genuine opportunities, and not for any unrelated, discriminatory or unlawful purpose.",
            "Not resell, redistribute or scrape Contributors' information.",
            "Comply with applicable data-protection and employment laws in your dealings with Contributors.",
          ],
        },
        "Contributors should use their own judgement before sharing more personal information with any recruiter or organisation. The Operator is not responsible for what recruiters or organisations do outside the Platform.",
      ],
    },
    {
      id: "platform-ip",
      title: "The Platform's own intellectual property",
      body: [
        "The Platform itself, including its name, design, software and branding, is owned by the Operator. These Terms do not give you any right to copy, modify or reuse the Platform's software or branding.",
      ],
    },
    {
      id: "disclaimers",
      title: "Disclaimers",
      body: [
        "The Platform is provided \"as is\" and \"as available\". We do not promise that it will be uninterrupted, error-free or secure, or that any opportunity or outcome will result from using it. To the maximum extent the law allows, we disclaim all implied warranties.",
      ],
    },
    {
      id: "liability",
      title: "Limitation of liability",
      body: [
        "To the maximum extent permitted under Indian law, the Operator's total liability to you for any claim arising from the Platform is limited to the amount you paid to use it, which for this free Platform is zero. We are not liable for indirect, incidental or consequential losses, including lost opportunities, lost data or harm to reputation.",
      ],
    },
    {
      id: "indemnity",
      title: "Indemnity",
      body: [
        "You agree to indemnify and hold harmless the Operator against claims, damages and costs arising from Your Work, your use of the Platform, or your breach of these Terms.",
      ],
    },
    {
      id: "termination",
      title: "Ending your use",
      body: [
        `You can stop using the Platform at any time. To delete your account, email ${CONTACT_EMAIL}. We may suspend or end your access if you break these Terms or if we discontinue the Platform. Sections that by their nature should continue (such as the licence for content already displayed, the disclaimers and the limitation of liability) continue after your access ends.`,
      ],
    },
    {
      id: "changes",
      title: "Changes to these Terms",
      body: [
        "We may update these Terms from time to time. If we make material changes, we will take reasonable steps to tell users, such as a notice on the Platform. Continuing to use the Platform after changes take effect means you accept the updated Terms.",
      ],
    },
    {
      id: "law",
      title: "Governing law and disputes",
      body: [
        "These Terms are governed by the laws of India. Any dispute is subject to the exclusive jurisdiction of the courts of Bengaluru, Karnataka, India.",
      ],
    },
    {
      id: "contact",
      title: "Contact",
      body: [`Questions about these Terms can be sent to **${CONTACT_EMAIL}**.`],
    },
  ],
};

export const PRIVACY = {
  title: "Privacy Policy",
  intro: [
    `This Privacy Policy explains what personal data KIVO (the "Platform"), operated by ${OPERATOR} ("we", "us"), collects, why, who can see it, and your rights over it. It is written to follow India's Digital Personal Data Protection Act, 2023 (the "DPDP Act").`,
  ],
  sections: [
    {
      id: "responsible",
      title: "Who is responsible for your data",
      body: [
        `${OPERATOR}, based in Bengaluru, Karnataka, India, decides how and why your personal data is processed (the "Data Fiduciary" under the DPDP Act). You can reach us at **${CONTACT_EMAIL}**.`,
      ],
    },
    {
      id: "what-we-collect",
      title: "What we collect",
      body: [
        "**Information you give us**",
        {
          list: [
            "Account details: your name, email address and password (stored only in scrambled, hashed form that no one can read).",
            "Profile details you choose to add: whether you are a student, graduate or working professional; institution or organisation; degree and year of study, or current role and years of experience; LinkedIn link; location; headline; bio; skills; and whether you are open to opportunities.",
            "Your Work: projects, links and challenge submissions, including your explanation, time spent and key learnings.",
            "If you post a challenge for an organisation: the organisation's name, your contact email and the details of the brief.",
            "A record that you confirmed you are 18 or older and accepted our Terms and this Policy, with the date.",
            "Planned later: resumes and phone numbers, for verification and recruiter contact. We will only collect these once those features exist, and will ask for your consent at that time.",
          ],
        },
        "**Information collected automatically**",
        {
          list: [
            "Basic technical information needed to run and secure the Platform, such as server logs and the network address a request came from (used, for example, to block repeated password guessing).",
            "Your browser stores a login token and your light/dark-mode choice on your own device so you stay signed in and see your preferred theme. We do not use advertising or analytics cookies.",
          ],
        },
      ],
    },
    {
      id: "why",
      title: "Why we use it",
      body: [
        {
          list: [
            "To create and run your account and profile.",
            "To show your profile, projects and submissions to other users, recruiters and organisations. This is the core purpose of the Platform.",
            "To run features such as challenges, search, the talent directory and verification.",
            "To keep the Platform secure, prevent abuse, and send account emails such as password-reset codes.",
            "To contact you about the Platform.",
          ],
        },
      ],
    },
    {
      id: "visible",
      title: "What other people can see",
      body: [
        "KIVO is a discovery platform, so parts of your profile are public by design:",
        {
          list: [
            "**Public:** your name, headline, institution or role, skills, bio, location, LinkedIn link, \"open to opportunities\" status, projects and submissions, and verification details (including the verifier's name and title).",
            "**Not public:** your email address and password. Your email is visible only to the Platform's administrator, so we can run verification and contact you. Organisations' contact emails are also kept private.",
          ],
        },
        "You control most of what appears on your profile and can edit it at any time.",
      ],
    },
    {
      id: "sharing",
      title: "Who we share it with",
      body: [
        "We do not sell your personal data. We share it only:",
        {
          list: [
            "With other users, recruiters and organisations, as described above.",
            "With service providers who run the Platform for us and process data only on our behalf: Render (hosting), MongoDB Atlas (database) and Resend (email delivery).",
            "When required by law, or to protect the rights, safety or security of users or the Platform.",
          ],
        },
      ],
    },
    {
      id: "where",
      title: "Where your data is stored",
      body: [
        "Your data is stored with cloud providers whose servers may be outside India (our hosting runs in Singapore). We choose providers that handle data securely.",
      ],
    },
    {
      id: "how-long",
      title: "How long we keep it",
      body: [
        "We keep your data while your account is active or as needed to provide the Platform. If you ask us to delete your account, we delete your account, submissions and projects, except records we must keep by law. Verified submission records may be kept to preserve the integrity of verification, as explained in our Terms.",
      ],
    },
    {
      id: "rights",
      title: "Your rights",
      body: [
        "Under the DPDP Act you have the right to:",
        {
          list: [
            "Access the personal data we hold about you.",
            "Correct inaccurate or incomplete data (you can edit most of it yourself on your profile).",
            "Have your personal data deleted, subject to the exceptions above.",
            "Withdraw your consent, understanding that the Platform may no longer work for you.",
            "Nominate another person to exercise these rights if you die or become unable to.",
            "Raise a grievance with us, and if it is not resolved, with the Data Protection Board of India.",
          ],
        },
        `To use any of these rights, email **${CONTACT_EMAIL}**. We may need to confirm your identity first, and will respond within a reasonable time.`,
      ],
    },
    {
      id: "security",
      title: "How we protect it",
      body: [
        "We hash passwords, protect the admin panel with a separate credential, limit repeated login, admin and reset-code attempts, send reset codes only to your registered email, and keep emails off public pages. No online service is completely secure, so we cannot guarantee absolute security.",
      ],
    },
    {
      id: "age",
      title: "Age requirement",
      body: [
        "The Platform is only for people aged 18 and over. We do not knowingly collect personal data from anyone under 18. If we learn that we have, we will delete it.",
      ],
    },
    {
      id: "changes",
      title: "Changes to this Policy",
      body: [
        "We may update this Policy from time to time. If we make material changes, we will take reasonable steps to tell users, such as a notice on the Platform.",
      ],
    },
    {
      id: "contact",
      title: "Contact and grievances",
      body: [`For privacy questions, requests or complaints, contact **${CONTACT_EMAIL}**.`],
    },
  ],
};
