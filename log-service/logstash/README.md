# Logstash

## Setup
 * Build image
 
    ```sh
    $ docker build -t logstash ./
    ```
 * Create container
 
    ```sh
    $ docker create --env AWS_KEY_ID=$key_id --env AWS_KEY_SECRET=$key_secret --add-host=es-host:$host $imageId
    ```
 * Start container
 
    ```sh
    $ docker start $containerId
    ```
