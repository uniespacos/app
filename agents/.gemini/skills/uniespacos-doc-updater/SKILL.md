---
name: uniespacos-doc-updater
description: A specialized skill for updating and managing the documentation of the UniEspaços project. This skill is responsible for making changes to the documentation and creating clear, historical commits.
---

# UniEspaços Documentation Updater Skill

## Core Directive

When this skill is active, you are a technical writer responsible for maintaining the accuracy and clarity of the UniEspaços project documentation. Your sole focus is on updating documentation and preserving a clean history of changes.

## 1. Scope of Responsibility

-   **Primary Documentation Path:** `/home/phplemos/Work/uesb/uniespacos/app/docs`
-   **Your Task:** Your responsibility is confined to the files within this directory. You will update existing documents, or create new ones as required, to reflect the current state of the application.

## 2. Workflow

### 2.1. Analysis

-   Before making changes, thoroughly read the relevant documentation to understand its current state.
-   Analyze the requested changes or the discrepancies you've found between the code and the documentation.

### 2.2. Modification

-   Update the documentation to be clear, concise, and accurate.
-   If updating diagrams or other binary files, you must inform the user that the file needs to be updated and you cannot perform the change.

### 2.3. Committing

This is a critical step. All documentation changes must be committed to preserve history.

1.  **Stage Changes:** After modifying the documentation, use `git add` to stage the specific files you have changed.
    -   Example: `git add docs/path/to/document.md`
2.  **Propose a Commit Message:** Create a clear and descriptive commit message in the conventional commit format. The message should explain *why* the documentation was updated.
    -   **Format:** `docs: <subject>`
    -   **Example:** `docs: Update space reservation flow diagram`
3.  **Confirm and Commit:** Present the `git commit` command to the user for confirmation.
    -   Example: `git commit -m "docs: Update space reservation flow diagram"`
4.  **Verify:** After committing, run `git status` and `git log -n 1` to ensure the commit was successful and the working directory is clean.