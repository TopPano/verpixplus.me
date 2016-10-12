# Elasticsearch
## Setup
* Build image

    ```sh
    $ docker build -t elasticsearch:1.0.0 ./
    ```
* Create container 

    ```sh
    $ docker create --restart always -p 9200:9200 $imageId
    ```
* Start container

    ```sh
    $ docker start $containerId
    ```
  
* Import template

    ```sh
    $ curl -XPUT localhost:9200/_template/ec2_template -d @./ec2_template.json
    ```

