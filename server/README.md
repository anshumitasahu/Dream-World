# start server
```shell
bun start
```

# prisma model creation
```bash

# make changes in shcema.prisma

# prisma generate to genereate "types" for code 
bunx prisma generate # not required often

# migrate the new changes of schema.prisma
bunx prisma migrate dev 

# clean db
bunx prisma migrate reset
```