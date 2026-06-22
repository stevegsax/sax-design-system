---
title: "Reproducible backtests with pinned data snapshots"
date: 2026-05-19
author: "J. Lindqvist"
tags: ["tooling"]
---

A backtest that cannot be re-run byte-for-byte is an anecdote. Our harness pins
both the strategy code and the data snapshot it ran against, so every result in a
research note can be regenerated with one command.

<!--more-->

## One command, one result

```
sax backtest run --strategy momentum-v3 \
  --snapshot 2026-05-15T00:00Z --seed 42
```

The `--snapshot` flag resolves to a content-addressed dataset, which is what makes
the guarantee hold even after vendors restate history. The strategy reference is a
git commit, not a branch, so "momentum-v3" means exactly one set of rules forever.

## Why restated history breaks naive backtests

Vendors revise prices, dividends, and corporate actions weeks after the fact. A
backtest that reads "the latest data" silently changes its answer every time a
revision lands. Pinning the snapshot turns the dataset into an immutable input:

- The seed fixes any stochastic component.
- The snapshot fixes the data.
- The commit fixes the rules.

Given those three, the output is a pure function of its inputs — which is the only
state in which a backtest result is worth quoting to a client.
