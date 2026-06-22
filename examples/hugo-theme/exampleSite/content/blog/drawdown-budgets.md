---
title: "Drawdown budgets as optimizer constraints"
date: 2026-06-03
author: "M. Okafor"
tags: ["risk", "methodology"]
---

Most risk frameworks treat drawdown limits as a circuit breaker: breach the limit,
cut exposure. We prefer to express the budget inside the optimizer itself, so the
portfolio never wants to take positions it would be forced to unwind.

<!--more-->

## The circuit-breaker problem

A post-hoc limit is enforced only after a loss has already happened. By then the
portfolio is holding the positions that produced the loss, and the act of cutting
exposure crystallizes it. Worse, the forced sale usually lands at the least
liquid moment, so the realized cost exceeds the paper loss that triggered it.

> A constraint you enforce after the fact is a constraint your optimizer was
> allowed to ignore.

## Budgets in the objective

Instead we add the drawdown budget as a constraint in the allocation step. The
optimizer prices the cost of approaching the limit and steers around it, the same
way it already trades off expected return against turnover and concentration.

- Position sizing reflects the remaining budget, not just current volatility.
- Correlated bets are penalized before they cluster, not after.
- The path matters: two portfolios with the same volatility can have very
  different drawdown profiles, and the constraint sees the difference.

The practical effect is fewer forced sales in stressed markets, at the cost of a
modest reduction in expected return during calm regimes. We think that trade is
underpriced.
