FROM nginx:1.27-alpine

COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html styles.css healthz /usr/share/nginx/html/
COPY src /usr/share/nginx/html/src

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
