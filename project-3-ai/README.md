# Project 3 - AI

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/nrlzmn/workshop-q1-2026/tree/main/project-3-ai)

### Step 1: Set `CLOUDFLARE_ACCOUNT_ID` value

* From [Cloudflare Dashbord](https://dash.cloudflare.com/), click on `...` next to your account name > click `Copy account ID`:

![Copy Account ID](./assets/copy-account-id.png)

### Step 2: Set `AI_GATEWAY_ID` value

* Use: `kai-gateway`

* From [Cloudflare Dashbord](https://dash.cloudflare.com/profile/api-tokens/), go to **My Profile** > **Create Token** > **Create Custom Token** with the following p

### Step 3: Set `AI_GATEWAY_AUTH_TOKEN` value

* From [Cloudflare Dashbord](https://dash.cloudflare.com/profile/api-tokens/), go to **My Profile** > **Create Token** > **Create Custom Token** with the following permissions:
    * AI Gateway - Read 
    * AI Gateway - Edit
    * Workers AI - Read

* Copy the token and add to Workers > Variables & Secrets > Add Variable:
    * Name: `AI_GATEWAY_AUTH_TOKEN`
    * Value: `<your-token>`

<details>
<summary>Reference</summary>

* [AI Gateway](https://developers.cloudflare.com/ai-gateway/get-started/) - Observe and control AI apps

</details>