# Elasticsearch
## Setup
* Build image

    ```sh
    $ docker build -t elasticsearch:1.0.0 ./
    ```
* Create container 

    ```sh
    $ docker create -p 9200:9200 $imageId
    ```
* Start container

    ```sh
    $ docker run $containerId
    ```
  
* Import template

    ```sh
    $ curl -XPUT localhost:9200 -d @./ec2_template.json
    ```

