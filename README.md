# Kukai

## Development
Kukai is built using Angular 15

Install dependencies:

`npm i`

Run during development:

`ng serve --open`

Run Kukai through Docker container, follow this: 

Building the image:

`docker build -t kukai-wallet:latest .`

Running the container:

`docker run -d -p 4200:80 --name kukai-cont kukai-wallet:latest`

OR
Directly run the container using docker compose

`docker compose up -d`


## Latest Audit
[Least Authority](audit/Least%20Authority%20-%20Tezos%20Foundation%20Kukai%20Wallet%20Final%20Audit%20Report.pdf) (2022-03-04)
