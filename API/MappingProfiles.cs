using AutoMapper;
using Core.Entities;

namespace API
{
    public class MappingProfiles : Profile
    {
        public MappingProfiles()
        {
            // Product mappings
            CreateMap<Product, ProductDto>();
            CreateMap<CreateProductDto, Product>();
            CreateMap<UpdateProductDto, Product>();
            
            // Cart mappings
            CreateMap<ShoppingCart, CartDto>();
            CreateMap<CartItem, CartItemDto>();
            CreateMap<CartItemDto, CartItem>();
            CreateMap<AddCartItemDto, CartItem>();
            CreateMap<AppliedDiscount, AppliedDiscountDto>()
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type.ToString()));
        }
    }
}
