---
id: D3b
title: Depth chạy server-side, cache theo hash ảnh
status: accepted
date: 2026-07-24
supersedes: null
superseded_by: null
amends: D3
amended_by: []
---

> **[Cập nhật M1 — 2026-07-24]** Depth estimation tính **1 lần/ảnh** (không per-frame) → cho **M1-web depth cũng chạy server-side/cloud** (cache theo hash), đặt sau interface `AIGateway.depth()` để M2-mobile swap on-device. Điều này sửa lại tiền đề cũ "depth on-device vì real-time". Chi tiết ở spec M1.
