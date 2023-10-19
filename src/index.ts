import express, { Request, Response } from "express";
import axios, { AxiosResponse } from "axios";
import http from "http";
import _ from "lodash";
import config from "./config";

const app = express();

interface Blog {
  id: string;
  title: string;
  image_url: string;
}

app.get("/api/blog-stats", async (req: Request, res: Response) => {
  try {
    const response: AxiosResponse<{ blogs: Blog[] }> = await axios.get(
      "https://intent-kit-16.hasura.app/api/rest/blogs",
      {
        headers: {
          "x-hasura-admin-secret": config.AUTH_TOKEN,
        },
      }
    );

    const data = response.data.blogs;
    const totalBlogs = data.length;
    const longestTitleBlog = _.maxBy(data, (blog) => blog.title.length);
    const blogsWithPrivacy = data.filter((blog) =>
      blog.title.toLowerCase().includes("privacy")
    );
    const uniqueTitles = _.uniqBy(data, "title");

    res.json({
      totalBlogs,
      longestTitleBlog: longestTitleBlog?.title || "",
      blogsWithPrivacy: blogsWithPrivacy.length,
      uniqueTitles: uniqueTitles.map((blog) => blog.title),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "An error occurred while fetching or analyzing the data.",
    });
  }
});

app.get("/api/blog-search", async (req: Request, res: Response) => {
  const query = req.query.query as string;

  if (!query) {
    return res.status(400).json({ error: "Please provide a query parameter." });
  }

  try {
    const response: AxiosResponse<{ blogs: Blog[] }> = await axios.get(
      "https://intent-kit-16.hasura.app/api/rest/blogs",
      {
        headers: {
          "x-hasura-admin-secret": config.AUTH_TOKEN,
        },
      }
    );

    const data = response.data.blogs;
    const filteredBlogs = data.filter((blog) =>
      blog.title.toLowerCase().includes(query.toLowerCase())
    );

    res.status(200).json(filteredBlogs);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while searching for blogs." });
  }
});

const server = http.createServer(app);

server.listen(config.PORT, () => {
  console.log("Server running on https://localhost:8080");
});
