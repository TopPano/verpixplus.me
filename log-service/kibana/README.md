# Kibana
## Setup
* Build image
 
    ```sh
    $ docker build -t kibana ./
    ```
* Create container
 
    ```sh
    $ docker create --env ELASTICSEARCH_URL=http://$host:$port -p $expose_port:5601  $imageId
    ```
* Start container
  
    ```sh
    $ docker start $containerId
    ```
