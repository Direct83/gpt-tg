build:
	docker build -t gpttg .

run:
	docker run -d -p 3000:3000 --name gpttg --rm gpttg
