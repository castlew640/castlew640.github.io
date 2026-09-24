# Quick Task 260924-igc: Prune old Pages history after each deploy

**Requested:** 2026-09-24 by the owner, after a one-off manual cleanup of 10 old deployments, 10 artifacts and 12 workflow runs.

## Task

Add a `prune` job to `.github/workflows/pages.yml` that runs only after a successful `deploy` on a push to `master` and deletes:

- every repository deployment except the newest `github-pages` deployment (marked inactive first, as the API requires);
- every Actions artifact not produced by the current run;
- every completed workflow run except the current one (in-progress runs, such as a newer push, are left alone).

The job uses the built-in token with `actions: write` and `deployments: write`. It is separate from `deploy`, so a prune failure never blocks a release.

## Verification

- The workflow parses as YAML and the job graph is `build → deploy → prune`.
- The job's jq selections, run read-only against the live repository, select nothing to delete when only the live release remains.
- The first real run succeeds and leaves one deployment, one run and one artifact.
