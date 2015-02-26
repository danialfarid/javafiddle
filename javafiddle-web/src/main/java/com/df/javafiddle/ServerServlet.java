package com.df.javafiddle;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@SuppressWarnings("serial")
public class ServerServlet extends HttpServlet {

    public static String HTML_CONTENT = null;

    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        if (!req.getRequestURI().contains("static")) {
            resp.setStatus(HttpServletResponse.SC_MOVED_PERMANENTLY);

            String url = "http://" + req.getServerName() + ":" + req.getServerPort() + "/static/index.html";
            System.out.println(url);
            resp.setHeader("Location", url);
        }

                resp.getWriter().write("AAAAAAA");


//        if (req.getAttribute("internal-redirect") == null) {
//            req.setAttribute("internal-redirect", true);
//            req.getRequestDispatcher("/static/index.html").forward(req, resp);
////            resp.sendRedirect("/static/index.html");
//        } else {
//            super.service(req, resp);
//        }
//        resp.setContentType("text/html");
//        if (HTML_CONTENT == null) {
//            HTML_CONTENT = getIndexHtmlContent();
//        }
//        resp.getWriter().write(HTML_CONTENT);
    }
}
