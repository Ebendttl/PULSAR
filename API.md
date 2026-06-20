# API Documentation: PULSAR Launchpad Integrations

This document covers all external APIs, endpoints, request/response formats, and authentication mechanisms integrated into the PULSAR frontend client.

---

## 1. Krilly Walrus Sponsor API

The Krilly Walrus Sponsor API handles decentralized asset uploading, sponsoring storage fees so that client users do not require WAL tokens.

* **Base URL:** `https://walrus-sponsor.krill.tube`
* **Authentication:** HTTP Bearer token authentication. Custom developer keys are issued via the Krilly Console and must start with the prefix `sbk_live_`.
* **Headers:**
  ```http
  Authorization: Bearer sbk_live_...
  ```

### Endpoints

#### 1. Upload File (Sponsored)
Uploads media assets to Walrus for sponsored storage.

* **Path:** `/v1/upload`
* **Method:** `POST`
* **Content-Type:** `multipart/form-data`
* **Request Payload (Form Fields):**
  * `file` (File/Blob, required): The media file to be stored on Walrus (supported types: PNG, JPEG, GIF, WebP; max size: 10MB).
  * `creator_address` (string, required): The hex-encoded Sui address of the connected user wallet triggering the upload.
  * `epochs` (string, optional): The storage reservation duration in Walrus epochs (defaults to `"5"`).

* **Response (JSON, Status 200 OK):**
  ```json
  {
    "sponsored_blob_id": "0x51c7a884ef...",
    "blob_id": "qR6aW9kL...",
    "creator_address": "0x0dbd1d28e5...",
    "sponsor_address": "0x53ac8df910...",
    "tx_digest": "3gHpA9yZk...",
    "media_type": "image/png",
    "size": 204850
  }
  ```

* **Error Codes:**
  * `400 Bad Request`: Missing mandatory fields (`file` or `creator_address`), or file format is unsupported.
  * `401 Unauthorized`: Missing or malformed `Authorization` header, or API key is invalid.
  * `402 Payment Required`: The developer workspace has insufficient balance for gas fees or storage credits:
    ```json
    {
      "message": "Insufficient balance: need at least 200000000 for gas fee"
    }
    ```
  * `500 Internal Server Error`: Internal issue on the Krilly sponsor nodes.

* **Rate Limits:** [NEEDS INPUT: Krilly API rate limits are not configured or detailed in the local codebase].

---

## 2. Walrus Aggregator API

The public Walrus Aggregator is used to verify and fetch uploaded files.

* **Base URL:** `https://aggregator.walrus.space/v1`
* **Authentication:** None (Public access).

### Endpoints

#### 1. Fetch Media Blob
Retrieves the raw binary content of a stored blob.

* **Path:** `/{blob_id}`
* **Method:** `GET`
* **Response:** The stored file (e.g. `image/png`) with appropriate headers.

#### 2. Verify Blob Existence
Performs a fast existence check on a blob without downloading its binary content.

* **Path:** `/{blob_id}`
* **Method:** `HEAD`
* **Response:**
  * `200 OK`: Blob exists on Walrus and is ready for download.
  * `404 Not Found`: Blob does not exist or has expired.

---

## 3. Sui Blockchain JSON-RPC API

The frontend uses standard JSON-RPC endpoints to fetch and execute contract details.

* **Base URL (Testnet):** `https://fullnode.testnet.sui.io:443`
* **Base URL (Mainnet):** `https://fullnode.mainnet.sui.io:443`
* **Authentication:** None.

### Key Methods In Use

#### 1. Fetch Object Details
Used to query the shared `CollectionConfig` state parameters (e.g., current supply and active statuses).

* **Method:** `sui_getObject`
* **Parameters:**
  ```json
  [
    "0xac03d986504fa12774d133ab5f23c5fa4df5f1a710c4f3e671bb13b38b4ccb70",
    {
      "showContent": true
    }
  ]
  ```
