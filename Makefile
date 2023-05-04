build:
	docker build -t gptTg .

run:
	docker run -d -p 3000:3000 --name gptTg --rm gptTg
