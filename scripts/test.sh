
#! /bin/bash

output=$(nc -z localhost 8545; echo $?)
[ $output -eq "0" ] && trpc_running=true
if [ ! $trpc_running ]; then
  echo "Starting our own ganache node instance"
  # create 100 accounts for load tests
  ganache-cli -a 100 -i 3 \
  > /dev/null &
  trpc_pid=$!
fi
truffle test "$@"
if [ ! $trpc_running ]; then
  kill -9 $trpc_pid
fi