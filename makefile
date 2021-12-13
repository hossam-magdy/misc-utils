
# To install deno
# https://deno.land/manual/getting_started/installation
# curl -fsSL https://deno.land/x/install/install.sh | sh

fmt:
	deno fmt

test:
	deno test --allow-net ./*.ts
