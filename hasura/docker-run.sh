#! /bin/bash
docker run -p 8080:8080 \
       hasura/graphql-engine:v1.0.0-alpha27 \
       graphql-engine \
       --database-url postgres://davideads:@host.docker.internal:5432/fosas \
       serve --enable-console
