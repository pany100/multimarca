#!/bin/bash

echo "Deteniendo la aplicación next-app..."
pm2 stop next-app

echo "Eliminando la aplicación next-app..."
pm2 delete next-app

echo "Usando Node.js versión 18.17.0..."
nvm use 18.17.0

echo "Actualizando el repositorio desde git..."
git pull

echo "Desplegando migraciones de Prisma..."
npx prisma migrate deploy

echo "Generando el cliente de Prisma..."
npx prisma generate

echo "Iniciando la aplicación next-app..."
pm2 start npm --name "next-app" -- run build-and-start

echo "Mostrando los últimos 100 registros de logs de next-app..."
pm2 logs next-app --lines 100
