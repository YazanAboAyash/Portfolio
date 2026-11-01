# Reem's knowledge notes

Every `.md` file in this folder (except this README) is indexed for Reem, the site's chatbot, by `npm run rag:index`, which also runs on deploy. Reem quotes these notes to visitors, so treat everything here as **public**.

- One topic per file. The first `# ` heading becomes the source title; otherwise the file name does.
- `## ` headings split a note into sections, and each section is retrieved on its own. Keep each one self-contained.
- Write facts, not instructions. Reem treats retrieved text as data, never as rules.
- Renaming or deleting a file removes its old chunks on the next index run.
