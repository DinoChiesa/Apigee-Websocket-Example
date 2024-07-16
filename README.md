# Websocket example for Apigee

This is a very simple example of an Apigee API proxy that handles Websocket.

Contents:
* example ws server implemented in nodejs
* example API "pass-through" proxy that proxies Websocket

## Disclaimer

This example is not an official Google product, nor is it part of an
official Google product.

## Screencast

I've made a [screencast](https://youtu.be/TrGftwcI-Ps) walking through all this.


## Pre-requisites

* Apigee X or hybrid
* npm 8.30 or later
* node 16 or later
* ngrok (optional)
* Cloud Run (optional)
* Postman

## Instructions

### Start the server

You have two options:
1. super simple: start the server in Cloud Run
2. more work: start the server locally and use ngrok to provide access.

In either case you need a terminal window:

1. Open a terminal window


2. in  your terminal, cd into the directory for the server
   ```
   cd server
   ```


#### Option A: Start the server in Cloud run

1. Specify some settings for your environment:
   ```
    PROJECT_ID=my-project-id
    SERVICE_NAME=example-ws-service
    REGION=us-west1
   ```

2. Deploy into cloud run:
   ```
    gcloud run deploy ${SERVICE_NAME} \
        --source . \
        --cpu 1 \
        --memory '256Mi' \
        --min-instances 0 \
        --max-instances 1 \
        --allow-unauthenticated \
        --project ${PROJECT_ID}\
        --region ${REGION} \
        --timeout 3600s
   ```

3. Using a text editor, modify [the apiproxy target](./apiproxy/targets/default.xml) to
   specify the endpoint that your gcloud command provided.  Replace `http` with `wss`.



#### Option B: run the server locally

1. install the prerequisites
   ```
   npm install
   ```

2. start the server:
   ```
   node ./server
   ```

3. Download the ngrok tool from [ngrok.com](https://https://ngrok.com/).  This
   is a local application that exposes a local system to the internet,
   temporarily.

4. open a separate terminal window

5. Within that terminal window, run ngrok to expose port 5950
   ```
   ngrok http 5950
   ```
   You will see an ngrok DNS name. This is the name at which you can
   reach your local server, over the internet.  An _example_ might be
   http://7959-50-35-82-179.ngrok.io  Your URL will be different!

6. Using a text editor, modify [the apiproxy target](./apiproxy/targets/default.xml) to specify
   the endpoint that your ngrok command provided.
   Replace `http` with `wss`.


### Import and Deploy the modified API Proxy

You have two options:

1. via the UI
   a. Zip up the apiproxy directory, eg, with the Finder/Explorer
   b. use the Apigee UI to import the zipped proxy bundle.
   c. Use the Apigee UI to deploy the imported proxy.


2. use the terminal, with  [apigeecli](https://github.com/apigee/apigeecli)
   a. Import
      ```
      TOKEN=$(gcloud auth print-access-token)
      ORG=my-apigee-project-id
      apigeecli apis create bundle -f apiproxy --name ws-passthrough -o $ORG --token $TOKEN
      ```

   b. Deploy
      ```
      ENV=my-apigee-env
      apigeecli apis deploy --wait --name ws-passthrough --ovr --org $ORG --env $ENV --token $TOKEN
      ```


### Invoke the Endpoint with Postman

1. Direct:

   - Click the "New" connection button.  Specify Websocket.

   - If you are using ngrok, Specify the connection url as the ngrok.io URL, something like
     wss://7959-50-35-82-179.ngrok.io  Your URL will be different!

   - If you are using Cloud run, the URL is emitted when you deploy. you can inquire it this way from a terminal:
     ```
     gcloud run services describe example-ws-service --project ${PROJECT_ID}
     ```
     It will show y ou the URL. Something like this: https://example-ws-service-aw87cauquw.a.run.app
     Yours will be different!  When you specify the URL in Postman , replace `https` with `wss` .


   - Click the connect button. Then, send messages.

   - If using ngrok, switch to the terminal window to see your nodejs server. If using Cloud Run,
     view the logs for your cloud run service.

     In either case, the logs should indicate that it has received messages and sent responses.

2. Now, connect via the Apigee proxy:

   Disconnect in postman.

   Now specify the connection url as wss://YOUR-DNS-NAME-For-APIGEE/ws-passthrough

   Click the connect button.  Again,
   send messages.
   Again you should see log messages indicating activity.


### Teardown

If using ngrok, stop the ngrok server, with ^C in the window. Do the same for the nodejs server.
Undeploy the websocket proxy from your org.  All done!

If using Cloud Run:
```
gcloud run services delete ${SERVICE_NAME} \
    --project ${PROJECT_ID} \
    --region ${REGION}
```
