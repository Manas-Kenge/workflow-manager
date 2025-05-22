# syntax=docker/dockerfile:1
FROM varnish:7.6

LABEL maintainer="Plone Foundation <collective@plone.org>" \
      org.label-schema.name="workflow-manager-varnish" \
      org.label-schema.description="workflow-manager Varnish image." \
      org.label-schema.vendor="Plone Foundation"

COPY etc/varnish.vcl /etc/varnish/default.vcl
