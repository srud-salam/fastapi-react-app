create virtual environment
python3 -m venv env
source env/bin/activate

pip install fastapi
pip install "uvicorn[standard]"
pip install pydantic-settings
pip install SQLAlchemy
pip install passlib

python3 -m uvicorn main:app --reload


generate secret key
openssl rand -hex 32

pip install -r requirement.txt 



docker build --tag fastapi-brit .
docker run --detach --publish 3100:3100 fastapi-brit

az group create --name web-app-brit-rg --location eastus

az acr create --resource-group web-app-brit-rg \
--name webappbrit --sku Basic --admin-enabled true

ACR_PASSWORD=$(az acr credential show \
--resource-group web-app-brit-rg \
--name webappbrit \
--query "passwords[?name == 'password'].value" \
--output tsv)

az acr build \
  --resource-group web-app-brit-rg \
  --registry webappbrit \
  --image webappbrit:latest .

az appservice plan create \
--name webplanbrit \
--resource-group web-app-brit-rg \
--sku B1 \
--is-linux

az webapp create \
--resource-group web-app-brit-rg \
--plan webplanbrit --name webappbrit \
--docker-registry-server-password $ACR_PASSWORD \
--docker-registry-server-user webappbrit \
--role acrpull \
--deployment-container-image-name webappbrit.azurecr.io/webappbrit:latest


docker build --tag fastapi-brit .
docker tag fastapi-brit:latest webappbrit.azurecr.io/webappbrit:latest
docker push webappbrit.azurecr.io/webappbrit:latest
az webapp restart --name webappbrit --resource-group web-app-brit-rg