const routes = {
  publicRoutes: {
    home: "/",
    adminLogin: "/admin/login",
    policy: "/policy",
    terms: "/terms",
  },
  privateRoutes: {
    admin: {
      orders: {
        home: "/admin/order-management/order",
        view: (id: string) => `/admin/order-management/order/${id}`,
      },
      dashboard: "/admin/dashboard",

      landingPageManagement: {
        heroSection: {
          home: "/admin/landing-page-management/hero-section",
          create: "/admin/landing-page-management/hero-section/create",
          edit: (id: string) => `/admin/landing-page-management/hero-section/edit/${id}`,
        },
        ourService: {
          home: "/admin/landing-page-management/our-service",
          create: "/admin/landing-page-management/our-service/create",
          edit: (id: string) => `/admin/landing-page-management/our-service/edit/${id}`,
        },
        aboutNextSolveIT: {
          home: "/admin/landing-page-management/about-nextsolveit",
          create: "/admin/landing-page-management/about-nextsolveit/create",
          edit: (id: string) => `/admin/landing-page-management/about-nextsolveit/edit/${id}`,
        },
        teamMembersInfo: {
          home: "/admin/landing-page-management/team-members-info",
          create: "/admin/landing-page-management/team-members-info/create",
          edit: (id: string) => `/admin/landing-page-management/team-members-info/edit/${id}`,
        },
        ourProduct: {
          home: "/admin/landing-page-management/our-product",
          create: "/admin/landing-page-management/our-product/create",
          edit: (id: string) => `/admin/landing-page-management/our-product/edit/${id}`,
        },
        caseStudy: {
          home: "/admin/landing-page-management/case-study",
          create: "/admin/landing-page-management/case-study/create",
          edit: (id: string) => `/admin/landing-page-management/case-study/edit/${id}`,
        },
        ourBlogs: {
          home: "/admin/landing-page-management/our-blogs",
          create: "/admin/landing-page-management/our-blogs/create",
          edit: (id: string) => `/admin/landing-page-management/our-blogs/edit/${id}`,
        },
        contactUs: {
          home: "/admin/landing-page-management/contact-us",
          create: "/admin/landing-page-management/contact-us/create",
          edit: (id: string) => `/admin/landing-page-management/contact-us/edit/${id}`,
        },
        faqSection: {
          home: "/admin/landing-page-management/faq-section",
          create: "/admin/landing-page-management/faq-section/create",
          edit: (id: string) => `/admin/landing-page-management/faq-section/edit/${id}`,
        },
      },
      productManagement: {
        productCategory: {
          home: "/admin/product-management/product-category",
          create: "/admin/product-management/product-category/create",
          edit: (id: string) => `/admin/product-management/product-category/edit/${id}`,
        },
        brand: {
          home: "/admin/product-management/brand",
          create: "/admin/product-management/brand/create",
          edit: (id: string) => `/admin/product-management/brand/edit/${id}`,
        },
        productAttribute: {
          home: "/admin/product-management/product-attribute",
          create: "/admin/product-management/product-attribute/create",
          edit: (id: string) => `/admin/product-management/product-attribute/edit/${id}`,
        },
        productBenefit: {
          home: "/admin/product-management/product-benefit",
          create: "/admin/product-management/product-benefit/create",
          edit: (id: string) => `/admin/product-management/product-benefit/edit/${id}`,
        },
        inHouseProduct: {
          home: "/admin/product-management/in-house-product",
          create: "/admin/product-management/in-house-product/create",
          edit: (id: string) => `/admin/product-management/in-house-product/edit/${id}`,
        },
        vendorProduct: {
          home: "/admin/product-management/vendor-product",
          create: "/admin/product-management/vendor-product/create",
          edit: (id: string) => `/admin/product-management/vendor-product/edit/${id}`,
          view: (id: string) => `/admin/product-management/vendor-product/${id}`,
          viewVariants: (id: string) => `/admin/product-management/vendor-product/${id}/variants`,
        },
        requestReStockList: {
          home: "/admin/product-management/request-re-stock-list",
          create: "/admin/product-management/request-re-stock-list/create",
          edit: (id: string) => `/admin/product-management/request-re-stock-list/edit/${id}`,
        },
        comboOffer: {
          home: "/admin/product-management/combo-offer",
          create: "/admin/product-management/combo-offer/create",
          edit: (id: string) => `/admin/product-management/combo-offer/edit/${id}`,
        },
        productUpdateRequests: {
          home: "/admin/product-management/product-update-requests",
          create: "/admin/product-management/product-update-requests/create",
          edit: (id: string) => `/admin/product-management/product-update-requests/edit/${id}`,
        },
      },
      orderManagement: {
        order: {
          home: "/admin/order-management/order",
        },
        refundRequest: {
          home: "/admin/order-management/refund-request",
          view: (id: string) => `/admin/order-management/refund-request/${id}`,
        },
      },
      offerAndDealsManagement: {
        offerList: {
          home: "/admin/offers-management/offers",
          create: "/admin/offers-management/offers/create",
        },
        coupons: {
          home: "/admin/offers-management/coupons",
          create: "/admin/offers-management/coupons/create",
        },
      },
      manage: {
        team: {
          home: "/admin/manage-team",
          create: "/admin/manage-team/create",
          edit: (id: string) => `/admin/manage-team/edit/${id}`,
          view: (id: string) => `/admin/manage-team/${id}`,
        },
        customer: {
          home: "/admin/manage/customer",
          create: "/admin/manage/customer/create",
          edit: (id: string) => `/admin/manage/customer/edit/${id}`,
        },
        manager: {
          home: "/admin/manage/manager",
          create: "/admin/manage/manager/create",
          edit: (id: string) => `/admin/manage/manager/edit/${id}`,
        },
      },
      trashImage: "/admin/trash-image",
      banners: "/admin/banners",
      userRole: "/admin/user-role",
      settings: `/admin/settings`,
    },
  },
};

export default routes;
