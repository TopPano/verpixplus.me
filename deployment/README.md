# Deployment
## Setup
* Make new machine solving 'certificate signed by unknown authority' problem
 
    ```sh
    $ openssl s_client -connect buildmaster.verpixplus.me:443 -showcerts </dev/null 2>/dev/null | openssl x509 -outform PEM | tee /usr/local/share/ca-certificates/buildmaster.verpixplus.me.crt
    $ update-ca-certificates
    $ service docker restart
    ```
    ref: https://success.docker.com/Datacenter/Solve/I_get_%22x509%3A_certificate_signed_by_unknown_authority%22_error_when_I_try_to_login_to_my_DTR_with_default_certificates
    
* Pull images from docker registry
   ```sh
    $ docker pull $DOMAIN_NAME/$repository:$version
    ``` 

    example: 
    ```sh
    $ docker pull buildmaster.verpixplus.me/verpixplus_es:0.0.1
    ```
* Start service

    refer to the service repository respectively
 
