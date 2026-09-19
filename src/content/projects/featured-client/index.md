---
slug: featured-client
title: Eiffel Technologies — from site to Wi-Fi planning tools
summary: A three-contract client story about turning a practical product goal into a website, a manual Wi-Fi planner, and a focused AI planning demonstration. Controlled release proof: sample@example.com.
published: true
exhibitionOrder: 1
liveUrl: https://eiffeltechnology.com
contracts:
  - id: website
    title: Initial website
    description: Built the client website as the first engagement, translating the client's goals into a clear public presence.
    stack: [Supabase, Vercel]
    hosting: Supabase and Vercel
  - id: manual-planner
    title: Manual Wi-Fi planner
    description: Built a blueprint-based planner that recommends access-point locations and estimates coverage. Supabase and Vercel matched the expected modest traffic while reducing setup effort and billed infrastructure.
    stack: [Supabase, Vercel]
    hosting: Supabase and Vercel
  - id: ai-mvp
    title: AI planner MVP
    description: Built a limited AI-assisted planning demonstration with visible interactions so the client could explain the product idea to potential customers. AWS Lightsail accommodated the client's AWS preference with more predictable billing as the deployment rationale.
    stack: [AWS Lightsail]
    hosting: AWS Lightsail
screenshots:
  - src: ./clientScreenshot1.jpg
    alt: Eiffel Technologies WiFi coverage planning landing page with navigation, headline, and planner call to action.
    caption: The WiFi coverage planning landing page introduces the product and its floor-plan workflow.
  - src: ./clientscreenshot2.jpg
    alt: AI planner floor-plan analysis state showing agent telemetry and analysis steps beside a floor plan.
    caption: The AI planner analysis state shows the floor plan, telemetry, and staged analysis steps.
  - src: ./clientScreenshot3.jpg
    alt: Completed AI planner recommendation state showing a 3D coverage visualization with four access points.
    caption: The completed recommendation state shows a 3D coverage visualization and four access-point markers.
---

## One client, three contracts

I was the sole developer across these three paid engagements. Each contract asked for a different kind of delivery judgment: establish a useful public presence, turn a planning problem into a usable tool, then demonstrate how AI interactions could help explain the product direction.

The work is presented here as a local, readable record with approved screenshots and a link to the live client site. Client-owned source code is not included.

## Delivery judgment

For the initial website and manual planner, I recommended Supabase and Vercel to fit the client's expected modest traffic and reduce setup effort and billed infrastructure. For the limited AI MVP, I used AWS Lightsail to meet the client's AWS preference and selected it for more predictable billing. The AI work was a focused demonstration, not a production-complete planner.
