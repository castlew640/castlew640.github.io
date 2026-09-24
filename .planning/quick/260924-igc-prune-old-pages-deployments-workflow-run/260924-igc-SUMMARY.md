# Quick Task 260924-igc Summary: Prune old Pages history after each deploy

**Commit:** 3262fdd — `ci(260924-igc): prune old Pages deployments, runs and artifacts after each deploy`
**Status:** Complete and verified on the first real run.

## What changed

`.github/workflows/pages.yml` gained a `prune` job (`needs: deploy`, master pushes only, `actions: write` + `deployments: write`). After each successful deploy it deletes every other deployment (marking each inactive first), every artifact from other runs, and every other completed workflow run.

## Verification

- YAML parses; job graph is `build → deploy → prune`.
- Read-only dry run of the jq selections against the live repository selected nothing when only the live release remained.
- Run 36033430777 (build 11m57s, deploy 20s, prune 5s) deleted the previous release's deployment 6643091670, artifact 10821137903 and run 36027860664, leaving 1 deployment, 1 run and 1 artifact. The site still returned HTTP 200.

## Notes

- Deleting past runs also removes their logs, so a failed run's log is lost once a later deploy succeeds. Failed runs block the prune job (it only runs after a successful deploy), so failure logs survive until the next successful release.
- Pull-request runs are pruned too, once completed.
