package com.df.javafiddle;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.IOException;

public class RedirectFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException,
            ServletException {
        HttpServletResponse resp = (HttpServletResponse) response;
        HttpServletRequest req = (HttpServletRequest) request;
        String requestURI = req.getRequestURI();
        if (!requestURI.startsWith("/static") && !requestURI.startsWith("/_ah")) {
            if (requestURI.endsWith(".js") || requestURI.endsWith(".css") ||
                    requestURI.endsWith(".jpg") || requestURI.endsWith(".png") ||
                    requestURI.endsWith(".ico") || requestURI.endsWith(".gif")) {
                resp.setStatus(HttpServletResponse.SC_MOVED_PERMANENTLY);

                String url = "http://" + req.getServerName() + ":" + req.getServerPort() + "/static/index.html";
                url = "/static" + requestURI;
                resp.setHeader("Location", url);
                return;
            }
            String path = req.getSession().getServletContext().getRealPath("/static/index.html");
            resp.setStatus(HttpServletResponse.SC_OK);
            resp.setContentType("text/html");
            resp.getWriter().write(IOUtil.readFile(new File(path)));

            return;
        }
        chain.doFilter(req, resp);
    }

    @Override
    public void init(FilterConfig arg0) throws ServletException {
    }

    @Override
    public void destroy() {
    }
}