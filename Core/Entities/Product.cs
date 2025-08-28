using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public class Product : BaseEntity
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = null!;

        [Required]
        [StringLength(500)]
        public string Description { get; set; } = null!;

        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        [Required]
        [Url]
        public string PictureUrl { get; set; } = null!;

        [Required]
        [StringLength(50)]
        public string Type { get; set; } = null!;

        [Required]
        [StringLength(50)]
        public string Brand { get; set; } = null!;

        [Range(0, int.MaxValue)]
        public int QuantityInStock { get; set; }
    }
}
