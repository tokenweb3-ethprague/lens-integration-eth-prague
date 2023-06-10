# Token.com & Lens Protocol Integration

Repo for ETHPrague hackathon project

## :page_with_curl: Installation

**1)** Create a new project and generate a GCP `keyfile.json` for BigQuery and paste in the root folder:

It should look like this:

```
{
    "type": "service_account",
    "project_id": "",
    "private_key_id": "",
    "private_key": "",
    "client_email": "",
    "client_id": "",
    "auth_uri": "",
    "token_uri": "",
    "auth_provider_x509_cert_url": "",
    "client_x509_cert_url": "",
    "universe_domain": ""
  }
```

**2)** Set proper node version:

**`❍ asdf local nodejs 18.16.0`**

**3)** Install dependencies:

**`❍ npm i`**

**4)** Run build:

**`❍ npm run build`**

**5)** Run json generation with token-related lens posts:

**`❍ npm run start`**
