FROM nginx


WORKDIR /usr/share/nginx/html
ADD ballons.html .
ADD scripts scripts
ADD images images
ADD css css
RUN rm index.html
RUN ln -s ballons.html index.html
RUN rm /etc/nginx/conf.d/default.conf
ADD nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
